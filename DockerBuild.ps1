# Install-Module -Name BurntToast -Force

Write-Host "Starting Docker build..."

docker buildx build --builder mybuilder --platform linux/amd64,linux/arm64,linux/arm/v7 -t sobotat/cerberus-ai-web --push .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully."
    
    Import-Module BurntToast
    New-BurntToastNotification -Text "Docker Build", "Docker Build completed successfully!"
} else {
    Write-Host "❌ Build failed with exit code $LASTEXITCODE."

    Import-Module BurntToast
    New-BurntToastNotification -Text "Docker Build", "Docker Build failed!"
}
