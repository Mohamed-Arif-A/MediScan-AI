Write-Host "=== Creating Python virtual environment ==="
python -m venv .venv

Write-Host "=== Activating virtual environment ==="
. .\.venv\Scripts\Activate.ps1

Write-Host "=== Installing frontend dependencies ==="
cd frontend
npm install
cd ..

Write-Host "=== Installing backend dependencies ==="
cd backend
pip install -r requirements.txt
cd ..

Write-Host "=== Setup complete! ==="
