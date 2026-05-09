
  # Waste management

  This is a code bundle for Waste management. The original project is available at https://www.figma.com/design/3otuoE108gfxM8twSrdWIj/Waste-management.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend (Django REST Framework)

  Install backend dependencies:

  - `pip install -r backend/requirements.txt`

  Run migrations + seed demo data:

  - `python backend/manage.py migrate`
  - `python backend/manage.py seed_demo`

  Start the API server:

  - `python backend/manage.py runserver 8000`

  The frontend expects the API at `http://127.0.0.1:8000/api` (override with `VITE_API_BASE_URL`).
  