# Deployment script for Shravan Vision

# Check if Git is installed
try {
    git --version
    Write-Host "Git is installed. Proceeding with deployment..." -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed or not in PATH. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path -Path ".env.local")) {
    Write-Host "Warning: .env.local file not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path -Path ".env.example") {
        Copy-Item -Path ".env.example" -Destination ".env.local"
        Write-Host "Created .env.local from .env.example. Please edit it with your actual values." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "Error: Neither .env.local nor .env.example found. Please create .env.local manually." -ForegroundColor Red
        exit 1
    }
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Deployment instructions
Write-Host "
Deployment Instructions:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Ready for deployment'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host "2. Deploy to Vercel using the Vercel dashboard or CLI" -ForegroundColor White
Write-Host "3. Set up environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "4. Configure Supabase authentication URLs" -ForegroundColor White

Write-Host "
For detailed instructions, please refer to DEPLOYMENT.md" -ForegroundColor Green