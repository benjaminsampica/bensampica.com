# Add a migration

In a command line, while in the AzureSql.Shared folder, run the following command:

dotnet ef migrations add InitialCreate -o ./Infrastructure/AzureSql/Migrations --context AzureSql --startup-project ../AzureSql.Web/AzureSql.Web.csproj