"""Validate documented JSON examples against the models the API serves.

An example that has quietly stopped being valid is worse than no example: it is
copied, it fails, and the reader blames their own code. Each example in the MDX
is tagged with the model it illustrates:

    {/* schema: PurgeResult */}

    ```json
    { ... }
    ```

`check-api-surface.mjs` collects the tagged pairs and pipes them here as a JSON
array of `{schema, payload, location}`. Every payload is parsed by the real
model, which enforces required fields, types, and — because the models are
declared `extra="forbid"` — rejects fields that do not exist.

Failures are written to stdout, one per line. An empty stdout means every
example is valid.
"""

from __future__ import annotations

import json
import sys


def _models() -> dict[str, type]:
    """Every model reachable from the API, keyed by its schema name.

    Collected by walking the modules the API composes rather than by listing
    them, so a new response model is validatable the moment it is documented.
    """
    import importlib
    import inspect
    import pkgutil

    import pydantic

    import blitzecdn

    found: dict[str, type] = {}
    for module in pkgutil.walk_packages(
        blitzecdn.__path__, prefix=f"{blitzecdn.__name__}."
    ):
        try:
            imported = importlib.import_module(module.name)
        except Exception:  # noqa: BLE001 - a module we cannot import has no models
            continue
        for name, value in inspect.getmembers(imported, inspect.isclass):
            if issubclass(value, pydantic.BaseModel) and value is not pydantic.BaseModel:
                found.setdefault(name, value)
    return found


def main() -> int:
    examples = json.load(sys.stdin)
    models = _models()
    failures: list[str] = []

    for example in examples:
        name = example["schema"]
        model = models.get(name)
        if model is None:
            failures.append(
                f"{example['location']}: no model named {name} — check the tag"
            )
            continue
        # Computed fields are serialised into responses but rejected as input,
        # so a response example legitimately carries keys the constructor will
        # not take. Set them aside after confirming they are real, and validate
        # everything else strictly.
        payload = dict(example["payload"])
        computed = set(model.model_computed_fields)
        for key in computed & set(payload):
            del payload[key]

        try:
            model.model_validate(payload)
        except Exception as error:  # noqa: BLE001 - pydantic raises its own type
            detail = str(error).replace("\n", " ")
            failures.append(f"{example['location']}: invalid {name} example — {detail}")

    for failure in failures:
        print(failure)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
