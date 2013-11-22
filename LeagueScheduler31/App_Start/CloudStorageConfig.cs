using Microsoft.WindowsAzure;
using System.Configuration;

namespace LeagueScheduler
{
    public static class CloudStorageConfig
    {
        public static void Configure()
        {
            CloudStorageAccount.SetConfigurationSettingPublisher((configName, configSetter) => configSetter(ConfigSettingPublisher.GetSettingValue(configName)));
        }

        private static class ConfigSettingPublisher
        {
            public static string GetSettingValue(string key)
            {
                return ConfigurationManager.AppSettings.Get(key);
            }
        }
    }
}