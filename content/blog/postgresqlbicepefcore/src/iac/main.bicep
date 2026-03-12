param applicationDatabaseAdminsName string
param applicationDatabaseAdminsObjectId string
param applicationName string
param ecosystem string
param location string = resourceGroup().location

resource applicationIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2025-01-31-preview' = {
  name: '${applicationName}-${ecosystem}-umi-01'
  location: location
}
output applicationIdentityName string = applicationIdentity.name

var postgresServerName = '${applicationName}-${ecosystem}-dbs-01'
module postgresServerModule './postgres-server.bicep' = {
  params: {
    applicationDatabaseAdminsName: applicationDatabaseAdminsName
    applicationDatabaseAdminsObjectId: applicationDatabaseAdminsObjectId
    applicationIdentityName: applicationIdentity.name
    applicationName: applicationName
    ecosystem: ecosystem
    location: location
    resourceName: postgresServerName
  }
}
output applicationDatabaseServerHostName string = postgresServerModule.outputs.hostName
output applicationDatabaseServerDatabaseName string = postgresServerModule.outputs.databaseName

resource appServicePlan 'Microsoft.Web/serverfarms@2025-03-01' = {
  name: '${applicationName}-${ecosystem}-asp-01'
  location: location
  sku: {
    name: 'B1'
  }
}

resource webApp 'Microsoft.Web/sites@2025-03-01' = {
  name: '${applicationName}-${ecosystem}-web-01'
  location: location
  properties: {
    httpsOnly: true
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'ConnectionStrings__PostgresDatabase'
          value: postgresServerModule.outputs.connectionString
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: applicationIdentity.properties.clientId
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
