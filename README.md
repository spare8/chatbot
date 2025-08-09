# chatbot

# Setup

1. Setup the project
```bash
npm i
```
2. Create a file called .env in root
3. Add 
```bash
touch .env
echo OPENAI_API_KEY="<YOUR_OPENAI_API_KEY>" > .env
```
4. Create a folder called knowledgeBank
5. Create a folder with the name of the vector store you want to create
6. In each vector store folder, add the raw text files
7. Run the vector store sync script
```bash
npm run vector-store-sync
```