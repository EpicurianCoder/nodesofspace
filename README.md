# NodeGraph Interface

A powerful visual database management tool built with **Next.js**. NodeGraph lets users interactively add, tag, and connect image-based data in a live graph interface. Ideal for research, media archives, design planning, and any workflow requiring structured visual thinking.

---

## 🚀 Features

- Add nodes with text, tags, and images
- Upload and analyze images via AI for auto-tagging
- Assign categories, descriptions, and quantities
- Visualize connections between related nodes in a graph
- Edit and delete nodes through a smooth UI
- Store and retrieve all data through a persistent database
- Full support for web-based interaction with real-time updates

---

## 🛠 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nodegraph-interface.git
cd nodegraph-interface
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root of the project and add the following (update with your own values):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
VISION_API_KEY=your-google-cloud-vision-api-key
```

### 4. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

### 5. Build and run for production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
/pages         → Application routes and API endpoints
/components    → UI building blocks
/lib           → Utilities and helper logic
/styles        → Global and module-based styles
/public        → Static assets
```

---

## 💡 Example Workflow

1. Click **Add Node** to create a new entry
2. Upload an image or file
3. Process image for recognition and suggested tags
4. Add location, quantity, and other metadata
5. Submit the node to store it in the database
6. Watch connections form on the interactive graph
7. Edit or delete any node in real time

---

## 📄 License

MIT License – feel free to use, modify, and distribute.

---

## 📬 Contact

Questions, ideas, or feedback? Reach out at [you@example.com](mailto:you@example.com)
