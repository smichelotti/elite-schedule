using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Results;

namespace LeagueScheduler.Controllers
{
    public class LeaguesController : ApiController
    {
        //private const string partitionKey = "2013-14";
        //TODO: refactor this dependency out
        //private SchedulerTableContext context = ContextFactory.CreateContext();
        private ILeagueRepository repository = new LeagueRepository();

        public List<League> Get()
        {
            //return context.Leagues.ToList().OrderBy(x => x.Name).ToList();
            return this.repository.All.OrderBy(x => x.Name).ToList();
        }

        public League Get(int id)
        {
            //return context.Leagues.ToList().OrderBy(x => x.Name).ToList();
            return this.repository.Find(id);
        }

        public League Post(League item)
        {
            //item.RowKey = Guid.NewGuid().ToString();
            //item.PartitionKey = partitionKey;

            //this.context.AddObject("LSLeagues", item);
            //this.context.SaveChangesWithRetries();

            //TODO: need check to ensure league name is unique
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public League Put(League item)
        {
            //this.context.AttachTo("LSLeagues", item, "*");
            //this.context.UpdateObject(item);
            //this.context.SaveChanges();

            //TODO: need check to ensure league name is unique
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public HttpResponseMessage Delete(int id)
        {
            //var item = new League { PartitionKey = partitionKey, RowKey = id };
            //this.context.AttachTo("LSLeagues", item, "*");
            //this.context.DeleteObject(item);
            //this.context.SaveChanges();

            this.repository.Delete(id);
            this.repository.Save();
            var response = this.Request.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }

        [Route("api/leagues/{id}/publish")]
        public HttpResponseMessage PostPublish(int id)
        {
            var publisher = new LeaguePublisher();
            var json = publisher.Publish(id);

            //TODO: need to send back sensible code depending on publishing success
            //return this.Ok();

            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");

            return response;
        }

    }
}
