"""Dump the control plane's public interface surface as JSON.

The reference pages under `src/content/docs/reference/` are hand-written MDX,
deliberately: prose that explains why a flag exists is worth more than a
generated table. But hand-written prose cannot notice that a route was added,
so `check-api-surface.mjs` compares the documented surface against this dump
and fails when they disagree. Explanation stays human; coverage stays honest.

Run with the control plane's interpreter so `blitzecdn` imports:

    ../blitze-cdn-cp/.venv/bin/python scripts/extract-surface.py

Output is a single JSON object on stdout. Nothing here imports the web
project, and nothing here needs a database or a configured project directory.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def _routes() -> list[dict[str, object]]:
    """Every path/method pair the API serves, plus its response codes.

    `create_app` is called with no settings so the dump does not depend on a
    configured environment; the OpenAPI document is built from the decorators
    either way.
    """
    from blitzecdn.api import create_app

    schema = create_app().openapi()
    routes: list[dict[str, object]] = []
    for path, operations in schema.get("paths", {}).items():
        for method, operation in operations.items():
            if method.upper() not in {
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "HEAD",
                "OPTIONS",
            }:
                continue
            routes.append(
                {
                    "method": method.upper(),
                    "path": path,
                    "statuses": sorted(operation.get("responses", {})),
                }
            )
    return sorted(routes, key=lambda route: (route["path"], route["method"]))


def _schemas() -> list[str]:
    """Component schema names referenced by the API.

    Includes the `Body_*` entries FastAPI synthesises for multipart parameters.
    They are ugly and not worth explaining at length, but they are the names a
    client sees, and excluding them would leave a hole in the page that nothing
    checks.
    """
    from blitzecdn.api import create_app

    schema = create_app().openapi()
    return sorted(schema.get("components", {}).get("schemas", {}))


def _command_tree() -> dict[str, list[str]]:
    """Invocable commands and their parent groups, as an operator types them.

    Leaves and groups are kept apart because the reference does not document
    them the same way: every leaf must have a heading, while a group heading is
    editorial. `blitzecdn cache` holds only `purge`, so the page documents the
    leaf directly and never mentions the group — correct, not a gap.
    """
    from typer.main import get_command

    import blitzecdn.cli  # registers every command as an import side effect

    root = get_command(blitzecdn.cli.app)
    commands: list[str] = []
    groups: list[str] = []

    def walk(command: object, prefix: list[str]) -> None:
        children = getattr(command, "commands", None)
        for name, child in (children or {}).items():
            path = [*prefix, name]
            spelled = " ".join(["blitzecdn", *path])
            if getattr(child, "commands", None):
                groups.append(spelled)
                walk(child, path)
            else:
                commands.append(spelled)

    walk(root, [])
    return {"commands": sorted(commands), "groups": sorted(groups)}


def _settings_fields() -> list[str]:
    """Field names on the settings model, which are the TOML keys."""
    from blitzecdn.config import Settings

    return sorted(Settings.model_fields)


def _settings_environment_names() -> dict[str, str]:
    """Map each settings field to the `BLITZE_*` variable that overrides it.

    Config loading spells the pairing out as `value("BLITZE_X", "x", default)`,
    and the two halves are not derivable from each other — `output_limit_bytes`
    is set by `BLITZE_DEPLOYMENT_OUTPUT_LIMIT_BYTES`. Reading the pairs out of
    the source keeps the mapping authoritative rather than guessed. Secrets
    like `api_keys` are read straight from the environment and appear here with
    no TOML key, which is why the reference documents them by variable alone.
    """
    import re

    import blitzecdn.config

    source = Path(blitzecdn.config.__file__).read_text("utf8")
    pairs = re.findall(
        r'\(\s*"(BLITZE_[A-Z0-9_]+)",\s*"([a-z][a-z0-9_]*)"', source
    )
    mapping = {key: variable for variable, key in pairs}

    from blitzecdn.config import Settings

    # Settings read straight from the environment never appear in a pair. They
    # follow the conventional spelling, so derive it rather than hard-coding a
    # list that would go stale as quietly as the docs it is guarding.
    for key in Settings.model_fields:
        mapping.setdefault(key, f"BLITZE_{key.upper()}")
    return mapping


def _environment_variables() -> list[str]:
    """Every `BLITZE_*` name the control plane *reads* from its environment.

    Restricted to lookups. The control plane also *sets* variables for the
    processes it spawns — `BLITZE_RESULT_PATH` tells the Ansible callback
    plugin where to write — and those are an internal contract between the two
    halves, not something an operator configures.
    """
    import re

    import blitzecdn

    source_root = Path(blitzecdn.__file__).parent
    lookup = re.compile(
        r'(?:environ|env|supplied)(?:\.get)?\(\s*"(BLITZE_[A-Z0-9_]+)"'
        r'|(?:value|path_value)\(\s*"(BLITZE_[A-Z0-9_]+)"'
    )
    names: set[str] = set()
    for path in source_root.rglob("*.py"):
        for match in lookup.finditer(path.read_text("utf8")):
            names.add(match.group(1) or match.group(2))
    return sorted(names)


def main() -> int:
    from blitzecdn import __version__
    from blitzecdn.domain.sites import DESIRED_STATE_VERSION

    json.dump(
        {
            "version": __version__,
            "schemaVersion": DESIRED_STATE_VERSION,
            "routes": _routes(),
            "schemas": _schemas(),
            **_command_tree(),
            "settings": _settings_fields(),
            "settingVariables": _settings_environment_names(),
            "environment": _environment_variables(),
        },
        sys.stdout,
        indent=2,
    )
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
