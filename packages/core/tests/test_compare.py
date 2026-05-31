"""Tests for spatium_bio.compare and spatium_bio.cli.

Offline: manifest parsing, cosine_matrix math, family summary, CLI
argument parsing. Network: a tiny 2-target real run.
"""

from __future__ import annotations

import json

import numpy as np
import pytest

from spatium_bio.cli import build_parser
from spatium_bio.compare import (
    cosine_matrix,
    load_targets,
    summarise_families,
)

# --- manifest parsing ------------------------------------------------


def _write_manifest(tmp_path, targets):
    path = tmp_path / "targets.json"
    path.write_text(json.dumps({"targets": targets}))
    return path


def test_load_targets_parses_and_uppercases(tmp_path):
    path = _write_manifest(
        tmp_path,
        [
            {"id": "a", "pdb": "4hhb", "chain": "A", "family": "globin", "label": "α"},
            {"id": "b", "pdb": "1ake", "chain": "A", "family": "other", "label": "AdK"},
        ],
    )
    targets = load_targets(path)
    assert len(targets) == 2
    assert targets[0].pdb == "4HHB"  # uppercased
    assert targets[0].family == "globin"


def test_load_targets_rejects_duplicate_ids(tmp_path):
    path = _write_manifest(
        tmp_path,
        [
            {"id": "x", "pdb": "4HHB", "chain": "A", "family": "globin", "label": "a"},
            {"id": "x", "pdb": "1AKE", "chain": "A", "family": "other", "label": "b"},
        ],
    )
    with pytest.raises(ValueError, match="duplicate"):
        load_targets(path)


def test_load_targets_rejects_too_few(tmp_path):
    path = _write_manifest(
        tmp_path,
        [{"id": "x", "pdb": "4HHB", "chain": "A", "family": "globin", "label": "a"}],
    )
    with pytest.raises(ValueError, match="at least 2"):
        load_targets(path)


# --- cosine_matrix ---------------------------------------------------


def test_cosine_matrix_identity_and_symmetry():
    vectors = [
        np.array([1.0, 0.0, 0.0]),
        np.array([1.0, 1.0, 0.0]),
        np.array([0.0, 0.0, 2.0]),
    ]
    m = cosine_matrix(vectors)
    assert m.shape == (3, 3)
    np.testing.assert_allclose(np.diag(m), 1.0, atol=1e-9)
    np.testing.assert_allclose(m, m.T, atol=1e-9)
    # v0 vs v2 are orthogonal
    assert m[0, 2] == pytest.approx(0.0, abs=1e-9)
    # v0 vs v1 = cos(45°)
    assert m[0, 1] == pytest.approx(1 / np.sqrt(2), abs=1e-9)


def test_cosine_matrix_rejects_zero_vector():
    with pytest.raises(ValueError, match="zero vector"):
        cosine_matrix([np.zeros(3), np.array([1.0, 2.0, 3.0])])


# --- summarise_families ----------------------------------------------


def test_summarise_families_within_vs_across():
    # Two families: {0,1} same, {2} other. Construct a matrix where
    # within-family pairs are high and across-family pairs are low.
    families = ["A", "A", "B"]
    matrix = np.array(
        [
            [1.00, 0.90, 0.20],
            [0.90, 1.00, 0.30],
            [0.20, 0.30, 1.00],
        ]
    )
    summary = summarise_families(families, matrix)

    assert summary["within_family"]["n"] == 1      # only (0,1)
    assert summary["within_family"]["mean"] == pytest.approx(0.90)
    assert summary["across_family"]["n"] == 2       # (0,2) and (1,2)
    assert summary["across_family"]["mean"] == pytest.approx(0.25)
    assert summary["separation"] == pytest.approx(0.65)
    assert summary["per_family_within"]["A"]["mean"] == pytest.approx(0.90)
    assert "B" not in summary["per_family_within"]  # singleton, no pair


def test_summarise_families_all_singletons():
    families = ["A", "B", "C"]
    matrix = np.eye(3)
    summary = summarise_families(families, matrix)
    assert summary["within_family"]["n"] == 0
    assert summary["within_family"]["mean"] is None
    assert summary["separation"] is None


def test_summarise_families_shape_mismatch():
    with pytest.raises(ValueError, match="does not match"):
        summarise_families(["A", "B"], np.eye(3))


# --- CLI parsing -----------------------------------------------------


def test_cli_parses_embed_compare():
    parser = build_parser()
    args = parser.parse_args(
        ["embed-compare", "--targets", "t.json", "--out", "r.json"]
    )
    assert args.command == "embed-compare"
    assert str(args.targets) == "t.json"
    assert str(args.out) == "r.json"
    assert args.device is None


def test_cli_requires_subcommand():
    parser = build_parser()
    with pytest.raises(SystemExit):
        parser.parse_args([])


def test_cli_embed_compare_requires_targets():
    parser = build_parser()
    with pytest.raises(SystemExit):
        parser.parse_args(["embed-compare", "--out", "r.json"])


# --- integration (network + model) -----------------------------------


@pytest.mark.network
def test_run_comparison_two_targets(tmp_path):
    from spatium_bio.compare import run_comparison

    targets = load_targets(
        _write_manifest(
            tmp_path,
            [
                {"id": "Hb_a", "pdb": "4HHB", "chain": "A", "family": "globin", "label": "α"},
                {"id": "AdK", "pdb": "1AKE", "chain": "A", "family": "other", "label": "AdK"},
            ],
        )
    )
    result = run_comparison(
        targets, device="cpu", cache_dir=tmp_path / "pdb", repo_hint=tmp_path
    )
    assert len(result["targets"]) == 2
    assert result["targets"][0]["n_residues"] == 141
    matrix = np.asarray(result["cosine_similarity_matrix"]["values"])
    assert matrix.shape == (2, 2)
    np.testing.assert_allclose(np.diag(matrix), 1.0, atol=1e-5)
    assert result["provenance"]["model"].endswith("35M_UR50D")
