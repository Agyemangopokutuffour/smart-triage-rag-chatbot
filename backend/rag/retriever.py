import os
import glob
from functools import lru_cache
import chromadb
from chromadb.utils import embedding_functions

# ── CONFIG ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")
KNOWLEDGE_DIR = os.path.join(BASE_DIR, "..", "knowledge")  # folder with your 5 .txt files
COLLECTION_NAME = "hospital_knowledge"
TOP_K = 3
# ────────────────────────────────────────────────────────────────────────────


def _chunk(text: str, max_chars: int = 500) -> list[str]:
    """Simple paragraph-based chunking. Swap in your original chunking logic."""
    chunks, current = [], ""
    for para in text.split("\n\n"):
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) < max_chars:
            current = f"{current}\n\n{para}".strip()
        else:
            if current:
                chunks.append(current)
            current = para
    if current:
        chunks.append(current)
    return chunks


def _ingest(collection):
    """Build the vector store from the .txt files in KNOWLEDGE_DIR."""
    ids, docs, metas = [], [], []
    for path in glob.glob(os.path.join(KNOWLEDGE_DIR, "*.txt")):
        name = os.path.basename(path)
        with open(path, "r", encoding="utf-8") as f:
            for i, chunk in enumerate(_chunk(f.read())):
                ids.append(f"{name}-{i}")
                docs.append(chunk)
                metas.append({"source": name})
    if docs:
        collection.add(ids=ids, documents=docs, metadatas=metas)


@lru_cache(maxsize=1)
def get_collection():
    """Connect once, build the collection if it's empty, reuse after that."""
    embedding_fn = embedding_functions.DefaultEmbeddingFunction()  # all-MiniLM-L6-v2 via ONNX
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )
    if collection.count() == 0:
        _ingest(collection)
    return collection


def retrieve(query: str, top_k: int = TOP_K) -> str:
    collection = get_collection()
    results = collection.query(query_texts=[query], n_results=top_k)

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    if not documents:
        return ""

    context_parts = []
    for doc, meta, dist in zip(documents, metadatas, distances):
        source = meta.get("source", "unknown")
        relevance = round((1 - dist) * 100, 1)
        context_parts.append(f"[Source: {source} | Relevance: {relevance}%]\n{doc}")

    return "\n\n---\n\n".join(context_parts)