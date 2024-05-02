---
title: 'Automatic Azure SQL Server'
subtitle: 'What the documentation fails to tell you.'
summary: 'How to create an Azure SQL Server automatically that uses Microsoft Entra authentication, deploys out initial permissions, and migrates using Entity Framework Core.'
authors:
- ben-sampica
categories:
- Azure
- IAC
- CSharp
date: '2024-05-02T00:00:00Z'
lastmod: '2024-05-02T00:00:00Z'
featured: false
draft: false
toc: true
---

{{% toc %}}

## The Story

I have been working a lot with cloud platforms - needing ephemeral resources that spin up (or delete) at the drop of a hat. Additionally, in a world of increasingly tighter compliance & security concerns including change management, deploying resources in an automatic, reproducible, and auditable way is more important than ever.

My task was to spin up an Azure SQL Server using the tools that my team uses - all automatically. However, the _way_ of doing this has changed over the years and the knowledge and documentation of doing so is all over the place. I've written this to compile a dozen different places (Microsoft docs, Stackoverflow, ChatGpt, Reddit, etc.) into one place.

## Overview 

Here's the end-to-end toolchain we are using, which the post will use:

- .NET 8
- Entity Framework Core (with its built-in migrations)
- Bicep
- Azure DevOps
- Azure

Overall, the end-state architecture is created to satisfy a process that requires two developers to approve a pull request, and a manager to approve changes. This is reflected in the following diagram:

{{< figure src="sqldatabase.png" title="Azure SQL Database Diagram" lightbox="true" >}}

Yours might differ, but this is what is being built and hopefully you can pull most of the pieces of this. The code for this post is available underneath this [GitHub repository](https://github.com/benjaminsampica/bensampica.com/tree/main/content/post/azsqlbicepefcore).

If you need to convert the bicep to Terraform or ARM, check out 

## The C# Code

If you've already got Entity Framework Core setup, skip to [Making a Migration](#making-a-migration).

### Entity Framework Core Setup

From a brand new `dotnet new webapi` application, add the following NuGet packages

```
Microsoft.EntityFrameworkCore.SqlServer
Microsoft.EntityFrameworkCore.Tools
```

Create a DbContext and add any associated database models.

```csharp

public class AzureSqlDbContext(DbContextOptions<AzureSqlDbContext> options) : DbContext(options)
{
    public DbSet<Todo> Todos { get; set; }
}

public class Todo
{
    public int Id { get; set; }
    public required string Name { get; set; }
}

```

Inside of `Program.cs`, register your DbContext to your services.

```csharp
builder.Services.AddDbContext<AzureSqlDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSql")));
```

### Making a Migration
Navigate to your `.csproj` and run the following migration command, where `InitialCreate` is the name of your migration, and run the following command

```
dotnet ef migrations add InitialCreate -o ./Migrations
```

## The Infrastructure (as code)

## The Initial Creation SQL Script

After the database exists, we need to run an initial script that will permission both the application that needs to perform CRUD operations on the database, as well as the product team itself that owns it so they can support it. In the following script, the development (`dev`) environment will grant the product team `dbo`, whereas any other environment will be `db_datareader`.

```sql
-- initialcreate.sql

-- $(productTeamIdentity) and $(applicationIdentity) are replaced in the pipeline.
-- Example: $(productTeamIdentity) is replaced with an Entra Group called `Products Team`, which contains a group of users responsible for the application.
-- Example: $(applicationIdentity) would be replaced with the name of the user-managed identity resource created in the infrastructure as code (dev-azuresql-umi-01) which the application is running as.

IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE [name] = $(productTeamIdentity))
BEGIN
    EXECUTE('CREATE USER [' + $(productTeamIdentity) + '] FROM EXTERNAL PROVIDER');
END;

IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE [name] = $(applicationIdentity))
BEGIN
    EXECUTE('CREATE USER [' + $(applicationIdentity) + '] FROM EXTERNAL PROVIDER');
END;
GO

IF ($(env) = 'dev')  
    BEGIN
        ALTER AUTHORIZATION ON SCHEMA::[dbo] TO $(productTeamIdentity)
    END
ELSE    
    BEGIN 
        ALTER AUTHORIZATION ON SCHEMA::[db_datareader] TO $(productTeamIdentity)
    END

ALTER AUTHORIZATION ON SCHEMA::[db_datareader] TO $(applicationIdentity)
ALTER AUTHORIZATION ON SCHEMA::[db_datawriter] TO $(applicationIdentity)

GO
```

## The Azure Pipeline
In your Azure Pipeline, you'll want to have a task to generate the EF Core Migration script that will be applied to the database. The following is an example:

```yaml
    # install the dotnet-ef tool which is used to generate migrations.
    - script: dotnet tool install --global dotnet-ef 
      displayName: Install .NET EF Core tools
    # Run a custom dotnet command, which we're choosing to run migrations.
    - task: DotNetCoreCLI@2
      displayName: 'Create migration'
      inputs:
        command: custom
        custom: ef
        arguments: 'migrations script --idempotent --project src/WebApplication --output $(Build.ArtifactStagingDirectory)/Migrations/migration.sql'
```

The `--project` argument specifies the path where the migration project is located. The `--output` argument specifies where to output the file. Finally, the `--idempotent` argument specifies to create a script that will apply only the migrations that have not yet been applied. For more information on these parameters or all available parameters, [click here](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/?tabs=dotnet-core-cli).

A simple example of the build stage might look like the following

```yaml
stages:
- stage: Build
  jobs:
  - job:
    pool:
      vmImage: ubuntu-latest
    displayName: 'Test, & Publish'
    steps:
    - task: DotNetCoreCLI@2
      displayName: 'dotnet publish'
      inputs:
        command: 'publish'
        publishWebProjects: true
        arguments: '-o $(Build.ArtifactStagingDirectory)'
        modifyOutputPath: false
    - script: dotnet tool install --global dotnet-ef 
      displayName: dotnet tool install dotnet-ef
    - task: DotNetCoreCLI@2
      displayName: 'Create migration'
      inputs:
        command: custom
        custom: ef
        arguments: 'migrations script --idempotent --project src/WebApplication --output $(Build.ArtifactStagingDirectory)/Migrations/migration.sql'
    - publish: $(Build.ArtifactStagingDirectory)
      displayName: 'Publish to Azure Devops'
      artifact: drop
```

For the next stage, we need to actually do the deploy. We need to:

- Deploy the infrastructure
- Deploy the initial scripts that will permission the product team as well as the application to be able to communicate with the database.
- Deploy the migration scripts we generated earlier in the build phase.

This stage might look like the following

```yaml
- stage: Deploy_NonProd
  dependsOn: Build
  jobs:
  - job: deploy
    pool:
      vmImage: windows-latest
    steps:
      # First, deploy the infrastructure setup in the bicep file. Our bicep file outputs some variables, which we capture in $jsonResult and set them as pipeline variables.
      - task: AzureCLI@2
        displayName: 'Deploy Infrastructure'
        inputs:
          # Replace `applicationDatabaseAdminsGroupName`, `applicationDatabaseAdminsObjectId`, and `azuresql` subscription name.
          # applicationDatabaseAdminsGroupName is the Entra group that contains the service principal doing the deploy as well as any additional users who would administrate the database. Example: APP_SqlDbAdmins
          # applicationDatabaseAdminsObjectId is the ObjectId of the group
          azureSubscription: azuresql-${{ parameters.deployEnvironment }}
          scriptType: ps
          scriptLocation: inlineScript
          inlineScript: |
            $jsonResult = az deployment group create `
              --resource-group ${{ parameters.deployEnvironment }}-ncus-azuresql-rg-01 `
              --template-file $(Build.SourcesDirectory)/iac/main.bicep `
              --parameters `
                  applicationDatabaseAdminsGroupName=App_SqlDbAdmins `
                  applicationDatabaseAdminsObjectId=37f7f235-527c-4136-accd-4a02d197296e ` 
                  deployEnvironment=${{ parameters.deployEnvironment }} `
              --mode Complete `
              | ConvertFrom-Json
      
            $sqlServerName = $jsonResult.properties.outputs.sqlServerName.value
            $sqlServerDatabaseName = $jsonResult.properties.outputs.sqlServerDatabaseName.value
            $userIdentityName = $jsonResult.properties.outputs.userIdentityName.value
            Write-Host "##vso[task.setvariable variable=sqlServerName;]$sqlServerName"
            Write-Host "##vso[task.setvariable variable=sqlServerDatabaseName;]$sqlServerDatabaseName"
            Write-Host "##vso[task.setvariable variable=userIdentityName;]$userIdentityName"
      - download: current # download the current repository so we can get the initialcreate.sql file.
        artifact: drop
      - task: SqlAzureDacpacDeployment@1
        # replace productTeamIdentity
        displayName: 'Setup initial permissions'
        condition: 
        inputs:
          azureSubscription: azuresql-${{ parameters.deployEnvironment }}
          authenticationType: 'servicePrincipal'
          deployType: 'sqlTask'
          serverName: $(sqlServerName)
          databaseName: $(sqlServerDatabaseName)
          sqlFile: '$(Pipeline.Workspace)\**\sql\*.sql'
          SqlAdditionalArguments: -Variable "productTeamIdentity='DevelopmentTeam'", "applicationIdentity='$(userIdentityName)'", "env=${{ parameters.deployEnvironment }}"
      - task: SqlAzureDacpacDeployment@1
        displayName: 'Deploy EF Migration'
        inputs:
          azureSubscription: azuresql-${{ parameters.deployEnvironment }}
          authenticationType: 'servicePrincipal'
          deployType: 'sqlTask'
          serverName: $(sqlServerName)
          databaseName: $(sqlServerDatabaseName)
          sqlFile: '$(Pipeline.Workspace)\**\Migrations\migration.sql'
```

