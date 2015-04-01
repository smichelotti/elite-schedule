using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace LeagueScheduler.Models
{
    public class DocumentRepository
    {
        private static readonly string environment = ConfigurationManager.AppSettings["environment"];
        private static readonly string containerName = "elite-schedule-docs-" + environment;

        public string Get(string key)
        {
            var blob = GetContainer().GetBlobReference(key);
            var json = blob.DownloadText();
            return json;
        }

        public List<string> GetWithPrefix(string prefix)
        {
            var client = GetBlobClient();
            //var blobs = client.ListBlobsWithPrefix(containerName + "/schedule-requests/league-28/");
            var blobs = client.ListBlobsWithPrefix(containerName + "/" + prefix);
            //var list = blobs.Select(x => x.Uri.ToString()).ToList();
            var list = blobs.Select(x => x.Uri.Segments[x.Uri.Segments.Length - 1]).ToList();
            return list;
        }

        public string GetFullWithPrefix(string prefix)
        {
            var container = GetContainer();
            var client = GetBlobClient();
            var blobs = client.ListBlobsWithPrefix(containerName + "/" + prefix);

            var fullBlob = new List<string>();
            foreach (var item in blobs)
            {
                var blob = container.GetBlobReference(item.Uri.ToString());
                fullBlob.Add(blob.DownloadText());
            }
            return "[" + string.Join(",", fullBlob.ToArray()) + "]";
        }

        public void Put(string key, string value)
        {
            //var client = GetBlobClient();
            //var blobs = client.ListBlobsWithPrefix(containerName + "/schedule-requests/league-28/");
            //var list = blobs.Select(x => x.Uri.ToString()).ToList();
            //foreach (var item in list)
            //{
            //    System.Console.WriteLine(item);
            //}

            var blob = GetContainer().GetBlobReference(key);
            blob.Properties.ContentType = "application/json";
            blob.UploadText(value);
        }

        public void Delete(string key)
        {
            var blob = GetContainer().GetBlobReference(key);
            BlobRequestOptions options;
            blob.Delete();
        }

        private CloudBlobContainer GetContainer()
        {
            // Get a handle on account, create a blob service client and get container proxy
            //var account = CloudStorageAccount.FromConfigurationSetting("AzureStorage");
            //var client = account.CreateCloudBlobClient();
            var client = GetBlobClient();
            return client.GetContainerReference("elite-schedule-docs-" + environment);
        }

        private CloudBlobClient GetBlobClient()
        {
            var account = CloudStorageAccount.FromConfigurationSetting("AzureStorage");
            var client = account.CreateCloudBlobClient();
            return client;
        }
    }
}