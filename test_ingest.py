import os
from chromadb import PersistentClient
import traceback

def test():
    try:
        print("Starting test...")
        client = PersistentClient(path='./chroma_db')
        collection = client.get_or_create_collection(name='diegoclaw_knowledge')
        print(f"Count before: {collection.count()}")
        print("Adding one test chunk...")
        collection.add(
            ids=["test_id_1"],
            documents=["This is a test document"],
            embeddings=[[0.0] * 1536],
            metadatas=[{"source": "test", "type": "note"}]
        )
        print(f"Count after: {collection.count()}")
        print("Done!")
    except Exception as e:
        print(f"Exception: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test()
