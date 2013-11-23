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
        private ILeagueRepository repository = new LeagueRepository();

        public List<League> Get()
        {
            return this.repository.All.OrderBy(x => x.Name).ToList();
        }

        public League Get(int id)
        {
            return this.repository.Find(id);
        }

        public League Post(League item)
        {
            //TODO: need check to ensure league name is unique
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public League Put(League item)
        {
            //TODO: need check to ensure league name is unique
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public HttpResponseMessage Delete(int id)
        {
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
