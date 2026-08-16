param applicationDatabaseAdminsGroupName string
param applicationDatabaseAdminsObjectId string
param deployEnvironment string

var appName = 'azuresql'
#disable-next-line no-hardcoded-location
var location = 'North Central US'

// Already created & must have ability to read Entra. `User.Read.All`, `GroupMember.Read.All`, and `Application.Read.All` permissions.
resource dbIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-07-31-preview' existing = {
  name: '${deployEnvironment}-${appName}-dbumi-01'
}

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: '${deployEnvironment}-${appName}-dbs-01'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${dbIdentity.id}': {}
    }
  }
  properties: {
    administrators: {
      azureADOnlyAuthentication: true
      sid: applicationDatabaseAdminsObjectId
      login: '${deployEnvironment}-${applicationDatabaseAdminsGroupName}'
    }
    primaryUserAssignedIdentityId: dbIdentity.id
  }

  resource sqlServerDatabase 'databases' = {
    name: '${deployEnvironment}-${appName}-db-01'
    location: location
    sku: {
      name: 'Basic'
      tier: 'Basic'
    }
  }
}
var sqlServerName = '${sqlServer.name}${environment().suffixes.sqlServerHostname}'
output sqlServerName string = sqlServerName
output sqlServerDatabaseName string = sqlServer::sqlServerDatabase.name

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${deployEnvironment}-${appName}'
  location: location
  sku: {
    name: 'B1'
  }
}

// This application identity is permissioned into the database. You could use a system-assigned identity from the web app as long as you don't have additional things this identity needs.
resource applicationIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-07-31-preview' = {
  name: '${deployEnvironment}-${appName}-appumi-01'
  location: location
}
output applicationIdentityName string = applicationIdentity.name

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${deployEnvironment}-ncus-${appName}-app-01'
  location: location
  properties: {
    httpsOnly: true
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'ConnectionStrings__AzureSqlDatabase'
          value: 'Server=tcp:${sqlServerName},1433;Initial Catalog=${sqlServer::sqlServerDatabase.name};Authentication=Active Directory Default;Encrypt=True;MultipleActiveResultSets=True;'
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: applicationIdentity.properties.clientId // See https://github.com/MicrosoftDocs/azure-docs/issues/105359
        }
      ]
    }
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${applicationIdentity.id}': {}
    }
  }
}
