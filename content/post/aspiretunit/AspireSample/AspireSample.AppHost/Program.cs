var builder = DistributedApplication.CreateBuilder(args);

var mssqlResource = builder.AddSqlServer("DefaultConnection")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume();

var apiService = builder.AddProject<Projects.AspireSample_ApiService>("apiservice")
    .WithReference(mssqlResource);

builder.AddProject<Projects.AspireSample_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
