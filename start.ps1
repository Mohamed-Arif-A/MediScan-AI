Write-Host "=== Activating Python virtual environment ==="
. .\.venv\Scripts\Activate.ps1

Write-Host "=== Starting frontend in new window ==="
Start-Process powershell -ArgumentList "cd frontend; npm start"

Write-Host "=== Starting backend in current window ==="
cd backend
uvicorn main:app --reload
