param applicationDatabaseAdminsName string
param applicationDatabaseAdminsObjectId string
param applicationIdentityName string
param applicationName string
param ecosystem string
param location string
param resourceName string

var ipAddressAllowList = [
  '0.0.0.0' // Azure
]

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2025-06-01-preview' = {
  name: resourceName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '18'
    authConfig: {
      // Only allow active directory auth
      activeDirectoryAuth: 'Enabled'
      passwordAuth: 'Disabled'
    }
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    backup: {
      backupRetentionDays: 30
      geoRedundantBackup: 'Disabled'
    }
  }

  resource database 'databases' = {
    name: '${applicationName}-${ecosystem}-db-01'
    properties: {}
  }
}

// This must be done separately due to conflicts with the Entra setup
resource ipFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2025-06-01-preview' = [for (ip, i) in ipAddressAllowList: {
  name: '${applicationName}-${ecosystem}-dbfw-0${i}'
  properties: {
    startIpAddress: ip
    endIpAddress: ip
  }
  parent: postgres
}]

// This must be after all other setup to avoid conflicts.
resource admin 'Microsoft.DBforPostgreSQL/flexibleServers/administrators@2025-06-01-preview' = {
  name: applicationDatabaseAdminsObjectId
  properties: {
    principalType: 'Group'
    principalName: applicationDatabaseAdminsName
  }
  parent: postgres
  dependsOn: [
    ipFirewallRule
  ]
}

output connectionString string = 'Server=${postgres.properties.fullyQualifiedDomainName};Database=${postgres::database.name};User Id=${applicationIdentityName};Port=5432;Ssl Mode=Require;'
output hostName string = postgres.properties.fullyQualifiedDomainName
output databaseName string = postgres::database.name
