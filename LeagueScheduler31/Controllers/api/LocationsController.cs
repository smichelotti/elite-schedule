using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LeagueScheduler.Controllers
{
    [Authorize]
    public class LocationsController : ApiController
    {
        //private const string partitionKey = "2013-14";
        //TODO: refactor this dependency out
        //private SchedulerTableContext context = ContextFactory.CreateContext();
        private ILocationRepository repository = new LocationRepository();

        public List<Location> Get()
        {
            //return context.Locations.ToList().OrderBy(x => x.Name).ToList();
            return this.repository.All.OrderBy(x => x.Name).ToList();
        }

        public Location Post(Location item)
        {
            //item.RowKey = Guid.NewGuid().ToString();
            //item.PartitionKey = partitionKey;

            //this.context.AddObject("LSLocations", item);
            //this.context.SaveChangesWithRetries();

            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public Location Put(Location item)
        {
            //this.context.AttachTo("LSLocations", item, "*");
            //this.context.UpdateObject(item);
            //this.context.SaveChanges();

            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public HttpResponseMessage Delete(int id)
        {
            //var item = new Location { PartitionKey = partitionKey, RowKey = id };
            //this.context.AttachTo("LSLocations", item, "*");
            //this.context.DeleteObject(item);
            //this.context.SaveChanges();

            this.repository.Delete(id);
            this.repository.Save();
            var response = this.Request.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }
    }
}
