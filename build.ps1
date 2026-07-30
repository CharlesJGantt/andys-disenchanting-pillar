$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$behaviorPack = Join-Path $projectRoot "Andys Disenchanting Pillar BP"
$resourcePack = Join-Path $projectRoot "Andys Disenchanting Pillar RP"
$dist = Join-Path $projectRoot "dist"

Write-Host "Validating JSON files..."
Get-ChildItem -LiteralPath $behaviorPack, $resourcePack -Recurse -Filter *.json | ForEach-Object {
    try {
        Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json | Out-Null
    }
    catch {
        throw "Invalid JSON: $($_.FullName)`n$($_.Exception.Message)"
    }
}

Write-Host "Checking workstation material compatibility..."
Get-ChildItem -LiteralPath (Join-Path $behaviorPack "blocks") -Recurse -Filter *.json | ForEach-Object {
    $blockJson = Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json
    $block = $blockJson.'minecraft:block'
    if (-not $block) { return }

    $materialSets = @($block.components.'minecraft:material_instances')
    $materialSets += @(
        $block.permutations |
            ForEach-Object { $_.components.'minecraft:material_instances' } |
            Where-Object { $_ }
    )
    foreach ($materialSet in $materialSets) {
        if (-not $materialSet) { continue }
        $methods = @(
            $materialSet.psobject.Properties.Value.render_method |
                Where-Object { $_ } |
                Sort-Object -Unique
        )
        if ($methods.Count -gt 1) {
            throw "Mixed material render methods in $($_.FullName): $($methods -join ', ')"
        }
    }
}

$horseUi = Join-Path $resourcePack "ui\horse_screen.json"
if ((Get-Content -Raw -LiteralPath $horseUi) -match '"modifications"\s*:') {
    throw "The custom horse UI contains the unsupported modifications property: $horseUi"
}

function Get-VersionString($value) {
    return (($value | ForEach-Object { [string]$_ }) -join ".")
}

$behaviorManifest = Get-Content -Raw -LiteralPath (Join-Path $behaviorPack "manifest.json") | ConvertFrom-Json
$resourceManifest = Get-Content -Raw -LiteralPath (Join-Path $resourcePack "manifest.json") | ConvertFrom-Json
$packageMetadata = Get-Content -Raw -LiteralPath (Join-Path $projectRoot "package.json") | ConvertFrom-Json
$behaviorVersion = Get-VersionString $behaviorManifest.header.version
$resourceVersion = Get-VersionString $resourceManifest.header.version

if ($behaviorVersion -ne $resourceVersion -or $behaviorVersion -ne [string]$packageMetadata.version) {
    throw "Version mismatch: BP=$behaviorVersion RP=$resourceVersion package=$($packageMetadata.version)"
}

foreach ($module in $behaviorManifest.modules) {
    $moduleVersion = Get-VersionString $module.version
    if ($moduleVersion -ne $behaviorVersion) { throw "Behavior-pack module version $moduleVersion does not match $behaviorVersion" }
}
foreach ($module in $resourceManifest.modules) {
    $moduleVersion = Get-VersionString $module.version
    if ($moduleVersion -ne $resourceVersion) { throw "Resource-pack module version $moduleVersion does not match $resourceVersion" }
}

$resourceDependency = $behaviorManifest.dependencies | Where-Object { $_.uuid -eq $resourceManifest.header.uuid }
$behaviorDependency = $resourceManifest.dependencies | Where-Object { $_.uuid -eq $behaviorManifest.header.uuid }
if (-not $resourceDependency -or (Get-VersionString $resourceDependency.version) -ne $resourceVersion) {
    throw "Behavior-pack resource dependency does not match resource-pack version $resourceVersion"
}
if (-not $behaviorDependency -or (Get-VersionString $behaviorDependency.version) -ne $behaviorVersion) {
    throw "Resource-pack behavior dependency does not match behavior-pack version $behaviorVersion"
}

$terrainAtlas = Join-Path $resourcePack "textures\terrain_texture.json"
if (-not (Test-Path -LiteralPath $terrainAtlas)) {
    throw "Missing resource-pack texture atlas: $terrainAtlas"
}

$pbrCapability = $resourceManifest.capabilities | Where-Object { $_ -eq "pbr" }
if (-not $pbrCapability) {
    throw "Resource pack must declare the pbr capability for Vibrant Visuals compatibility"
}

$textureList = Join-Path $resourcePack "textures\textures_list.json"
if (-not (Test-Path -LiteralPath $textureList)) {
    throw "Missing Vibrant Visuals texture list: $textureList"
}

$textureSets = Get-ChildItem -LiteralPath (Join-Path $resourcePack "textures\blocks") -Recurse -Filter *.texture_set.json
if (-not $textureSets -or $textureSets.Count -lt 1) {
    throw "Missing Vibrant Visuals block texture sets"
}

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "Checking JavaScript syntax..."
    Get-ChildItem -LiteralPath (Join-Path $behaviorPack "scripts") -Recurse -Filter *.js | ForEach-Object {
        & $node.Source --check $_.FullName
        if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax check failed: $($_.FullName)" }
    }
}
else {
    Write-Warning "Node.js was not found; JavaScript syntax checking was skipped."
}

foreach ($path in @($dist)) {
    $resolvedParent = [System.IO.Path]::GetFullPath((Split-Path -Parent $path))
    if ($resolvedParent -ne [System.IO.Path]::GetFullPath($projectRoot)) {
        throw "Refusing to clean a path outside the project: $path"
    }
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Recurse -Force }
    New-Item -ItemType Directory -Path $path | Out-Null
}

Write-Host "Packaging behavior and resource packs..."
$bpRelease = Join-Path $dist "Andys Disenchanting Pillar BP v$behaviorVersion.mcpack"
$rpRelease = Join-Path $dist "Andys Disenchanting Pillar RP v$behaviorVersion.mcpack"
$addon = Join-Path $dist "Andys Disenchanting Pillar v$behaviorVersion.mcaddon"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-OrderedPackFiles($root) {
    $manifest = Get-Item -LiteralPath (Join-Path $root "manifest.json")
    $icon = Get-Item -LiteralPath (Join-Path $root "pack_icon.png")
    $reserved = @($manifest.FullName, $icon.FullName)
    $remaining = Get-ChildItem -LiteralPath $root -Recurse -File |
        Where-Object { $_.FullName -notin $reserved } |
        Sort-Object { $_.FullName.Substring($root.Length + 1).Replace("\", "/") }
    return @($manifest, $icon) + @($remaining)
}

function New-BedrockArchive($output, $packs, [bool]$includePackFolder) {
    $temporaryZip = "$output.tmp.zip"
    if (Test-Path -LiteralPath $temporaryZip) {
        Remove-Item -LiteralPath $temporaryZip -Force
    }

    $zipStream = [System.IO.File]::Open(
        $temporaryZip,
        [System.IO.FileMode]::Create,
        [System.IO.FileAccess]::ReadWrite,
        [System.IO.FileShare]::None
    )
    $zipArchive = New-Object System.IO.Compression.ZipArchive(
        $zipStream,
        [System.IO.Compression.ZipArchiveMode]::Create,
        $false
    )

    try {
        foreach ($pack in $packs) {
            foreach ($file in (Get-OrderedPackFiles $pack.Root)) {
                $relativePath = $file.FullName.Substring($pack.Root.Length + 1).Replace("\", "/")
                $entryName = if ($includePackFolder) { "$($pack.Name)/$relativePath" } else { $relativePath }
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                    $zipArchive,
                    $file.FullName,
                    $entryName,
                    [System.IO.Compression.CompressionLevel]::Optimal
                ) | Out-Null
            }
        }
    }
    finally {
        $zipArchive.Dispose()
        $zipStream.Dispose()
    }

    Move-Item -LiteralPath $temporaryZip -Destination $output -Force
}

$bpDescriptor = @{ Name = "ADP_BP"; Root = $behaviorPack }
$rpDescriptor = @{ Name = "ADP_RP"; Root = $resourcePack }
New-BedrockArchive $bpRelease @($bpDescriptor) $false
New-BedrockArchive $rpRelease @($rpDescriptor) $false
New-BedrockArchive $addon @($bpDescriptor, $rpDescriptor) $true

$archive = [System.IO.Compression.ZipFile]::OpenRead($addon)
try {
    $entryNames = @($archive.Entries | ForEach-Object { $_.FullName.Replace("\", "/") })
    $requiredArchiveEntries = @(
        "ADP_BP/manifest.json",
        "ADP_BP/pack_icon.png",
        "ADP_RP/manifest.json",
        "ADP_RP/pack_icon.png"
    )
    foreach ($requiredEntry in $requiredArchiveEntries) {
        if ($entryNames -notcontains $requiredEntry) {
            throw "Built add-on is missing required archive entry: $requiredEntry"
        }
    }
    if ($entryNames | Where-Object { $_ -like "*.mcpack" }) {
        throw "Built add-on unexpectedly contains nested .mcpack files."
    }
    if ($archive.Entries | Where-Object { $_.FullName.EndsWith("/") }) {
        throw "Built add-on unexpectedly contains explicit directory entries."
    }
    if ($entryNames[0] -ne "ADP_BP/manifest.json" -or $entryNames[1] -ne "ADP_BP/pack_icon.png") {
        throw "Behavior-pack manifest and icon are not first in the archive."
    }
    $resourceManifestIndex = [Array]::IndexOf($entryNames, "ADP_RP/manifest.json")
    if ($resourceManifestIndex -lt 0 -or $entryNames[$resourceManifestIndex + 1] -ne "ADP_RP/pack_icon.png") {
        throw "Resource-pack manifest and icon are not first in the resource-pack section."
    }
}
finally {
    $archive.Dispose()
}

Write-Host "Built: $addon"
Write-Host "Fallback installers: $bpRelease"
Write-Host "                     $rpRelease"
