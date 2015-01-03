using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using System.Configuration;

namespace LeagueScheduler.Models
{
    public class DocumentRepository
    {
        private static readonly string environment = ConfigurationManager.AppSettings["environment"];

        public string Get(string key)
        {
            var blob = GetContainer().GetBlobReference(key);
            var json = blob.DownloadText();
            return json;
        }

        public void Put(string key, string value)
        {
            var blob = GetContainer().GetBlobReference(key);
            blob.Properties.ContentType = "application/json";
            blob.UploadText(value);
        }

        private CloudBlobContainer GetContainer()
        {
            // Get a handle on account, create a blob service client and get container proxy
            var account = CloudStorageAccount.FromConfigurationSetting("AzureStorage");
            var client = account.CreateCloudBlobClient();
            return client.GetContainerReference("elite-schedule-docs-" + environment);
        }
    }
}