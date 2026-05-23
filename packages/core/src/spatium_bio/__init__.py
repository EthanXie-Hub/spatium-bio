"""Spatium Bio — core library.

Today this package only handles protein I/O. Embedding and manifold
operators will land here when there is something real to ship.
"""

from spatium_bio.io import (
    compute_ca_distance_matrix,
    extract_chain_ca,
    fetch_pdb,
    parse_structure,
)

__all__ = [
    "compute_ca_distance_matrix",
    "extract_chain_ca",
    "fetch_pdb",
    "parse_structure",
]

__version__ = "0.0.1"
