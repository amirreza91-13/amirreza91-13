no changes added to commit (use "git add" and/or "git commit -a")
master
PS C:\Users\Mr\planner\frontend> Set-Location 'C:\Users\Mr\planner'; git status --short; git remote -v; Get-Content .gitignore
 M .gitignore
?? config/
?? core/
?? frontend/
?? manage.py
# Python
venv/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/

# Django local data and secrets
db.sqlite3
.env
.env.*
!.env.example

# Node and Vite
frontend/node_modules/
frontend/dist/
frontend/dist-ssr/
frontend/.env
frontend/.env.*
!frontend/.env.example

# Local editor files
.vscode/
.idea/
.DS_Store
Thumbs.db

# Local backups
frontend-backup-*.zip
frontend-old-*/

# Logs
*.log
PS C:\Users\Mr\planner>


