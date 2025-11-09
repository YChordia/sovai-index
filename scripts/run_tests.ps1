param(
  [switch]$Dev
)

$py = if (Test-Path ..\venv\Scripts\python.exe) { '..\venv\Scripts\python.exe' } elseif (Test-Path .\venv\Scripts\python.exe) { '.\venv\Scripts\python.exe' } else { 'python' }

if ($Dev) {
  if (Test-Path requirements-dev.txt) {
    & $py -m pip install -r requirements-dev.txt
  }
}

& $py -m pytest -q

