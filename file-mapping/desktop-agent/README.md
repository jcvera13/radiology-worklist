# Desktop Agent Setup

## Files to Add

Copy these files from the folders:

- `RadiologyOrchestrationAgent.csproj` - Project file
- `Program.cs` - Entry point
- `RadWhereAgentForm.cs` - Main form
- `appsettings.json` - Configuration

## Prerequisites

- Visual Studio 2022
- .NET 6.0 SDK
- PowerScribe One installed

## Setup

1. Open `RadiologyOrchestrationAgent.sln` in Visual Studio
2. Install NuGet packages
3. Build solution (Ctrl+Shift+B)
4. Run (F5)

System tray icon should appear indicating agent status.
