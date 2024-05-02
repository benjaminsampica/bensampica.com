
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