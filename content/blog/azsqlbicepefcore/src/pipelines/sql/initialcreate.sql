IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE [name] = $(productTeamIdentityName))
BEGIN
    EXECUTE('CREATE USER [' + $(productTeamIdentityName) + '] FROM EXTERNAL PROVIDER');
END;

IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE [name] = $(applicationIdentity))
BEGIN
    EXECUTE('CREATE USER [' + $(applicationIdentityName) + '] FROM EXTERNAL PROVIDER');
END;
GO

IF ($(env) = 'dev')  
    BEGIN
        ALTER AUTHORIZATION ON SCHEMA::[dbo] TO $(productTeamIdentityName)
    END
ELSE    
    BEGIN 
        ALTER AUTHORIZATION ON SCHEMA::[db_datareader] TO $(productTeamIdentityName)
    END

ALTER AUTHORIZATION ON SCHEMA::[db_datareader] TO $(applicationIdentityName)
ALTER AUTHORIZATION ON SCHEMA::[db_datawriter] TO $(applicationIdentityName)

GO