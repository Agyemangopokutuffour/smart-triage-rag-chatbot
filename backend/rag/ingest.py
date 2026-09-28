import os
import re
import chromadb
from chromadb.utils import embedding_functions

# ── CONFIG ──────────────────────────────────────────────────────────────────
DOCS_DIR = os.path.join(os.path.dirname(__file__), "docs")
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_store")
COLLECTION_NAME = "hospital_knowledge"
CHUNK_SIZE = 400        # target tokens per chunk
CHUNK_OVERLAP = 50      # overlap tokens between chunks
# ────────────────────────────────────────────────────────────────────────────


def clean_text(text: str) -> str:
    """Remove extra whitespace and normalize the text."""
    text = re.sub(r'\r\n|\r', '\n', text)          # normalize line endings
    text = re.sub(r'\n{3,}', '\n\n', text)         # collapse excess blank lines
    text = re.sub(r'[ \t]+', ' ', text)            # collapse spaces/tabs
    text = text.strip()
    return text


def split_into_chunks(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split text into overlapping chunks by word count (words ≈ tokens).
    Each chunk targets chunk_size words with overlap words of context carry-over.
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)

        # if we've reached the end, stop
        if end >= len(words):
            break

        # move forward by (chunk_size - overlap) so chunks share context
        start += chunk_size - overlap

    return chunks


def load_and_chunk_docs(docs_dir: str) -> tuple[list[str], list[dict], list[str]]:
    """
    Read every .txt file in docs_dir, clean it, chunk it,
    and return parallel lists of (chunks, metadatas, ids).
    """
    all_chunks = []
    all_metadatas = []
    all_ids = []
    chunk_index = 0

    txt_files = [f for f in os.listdir(docs_dir) if f.endswith(".txt")]

    if not txt_files:
        raise FileNotFoundError(f"No .txt files found in {docs_dir}")

    for filename in txt_files:
        filepath = os.path.join(docs_dir, filename)
        print(f"  📄 Loading: {filename}")

        with open(filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()

        cleaned = clean_text(raw_text)
        chunks = split_into_chunks(cleaned)

        print(f"     → {len(chunks)} chunks created")

        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            all_metadatas.append({
                "source": filename,
                "chunk_index": i,
                "total_chunks": len(chunks)
            })
            all_ids.append(f"{filename}_chunk_{chunk_index}")
            chunk_index += 1

    return all_chunks, all_metadatas, all_ids


def store_in_chromadb(chunks: list[str], metadatas: list[dict], ids: list[str]) -> None:
    """Embed all chunks and store them in ChromaDB."""

    # use ChromaDB's built-in sentence transformer (no OpenAI key needed)
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    client = chromadb.PersistentClient(path=CHROMA_DIR)

    # delete existing collection so re-running ingest starts fresh
    existing = [c.name for c in client.list_collections()]
    if COLLECTION_NAME in existing:
        client.delete_collection(COLLECTION_NAME)
        print(f"\n  🗑️  Cleared existing '{COLLECTION_NAME}' collection")

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )

    # store in batches of 50 to avoid memory spikes
    batch_size = 50
    total = len(chunks)

    print(f"\n  💾 Storing {total} chunks in ChromaDB...")

    for i in range(0, total, batch_size):
        batch_chunks = chunks[i:i + batch_size]
        batch_meta = metadatas[i:i + batch_size]
        batch_ids = ids[i:i + batch_size]

        collection.add(
            documents=batch_chunks,
            metadatas=batch_meta,
            ids=batch_ids
        )
        print(f"     → Stored chunks {i + 1} to {min(i + batch_size, total)} of {total}")

    print(f"\n  ✅ Done! {total} chunks stored in '{COLLECTION_NAME}'")


def main():
    print("=" * 55)
    print("  HEALTHBOT RAG — INGESTION PIPELINE")
    print("=" * 55)

    print(f"\n📁 Reading documents from: {DOCS_DIR}")
    chunks, metadatas, ids = load_and_chunk_docs(DOCS_DIR)

    print(f"\n📊 Total chunks ready for embedding: {len(chunks)}")
    print(f"   Chunk size:    ~{CHUNK_SIZE} words")
    print(f"   Chunk overlap: {CHUNK_OVERLAP} words")

    store_in_chromadb(chunks, metadatas, ids)

    print("\n" + "=" * 55)
    print("  INGESTION COMPLETE — ChromaDB is ready!")
    print("=" * 55)


if __name__ == "__main__":
    main()