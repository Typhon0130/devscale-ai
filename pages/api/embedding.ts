import { DocxLoader } from 'langchain/document_loaders';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set Config PineCone Environment
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT as string,
    apiKey: process.env.PINECONE_API_KEY as string,
  });

  // Local Data Embedding
  const base_url = __dirname.replace(
    '\\.next\\server\\pages\\api',
    '\\dummy_data\\',
  );

  try {
    const files = fs.readdirSync(base_url);
    for (const file of files) {
      const doc_path = base_url + file;
      const loader = new DocxLoader(doc_path);

      const rowDocs = await loader.load();

      // Split the documents into smaller chunks
      const text_splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await text_splitter.splitDocuments(rowDocs);

      console.log('Creating Vector Store');

      // Convert the document chunks to embedding and save them to the vector store
      const embeddings = new OpenAIEmbeddings();
      const index = pinecone.Index(process.env.PINECONE_INDEX ?? '');
      const dbConfig = {
        pineconeIndex: index,
        namespace: process.env.PINECONE_NAMESPACE ?? '',
        textKey: 'text',
      };
      await PineconeStore.fromDocuments(docs, embeddings, dbConfig);
    }
    return res.status(200).json({ msg: 'Success' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error' });
  }
};

export default handler;
