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
            System.Diagnostics.Trace.TraceInformation("about to call Leagues Controller GET");
            try
            {
                return this.repository.All.OrderBy(x => x.Name).ToList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceInformation(ex.ToString());
                throw;
            }
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
        public IHttpActionResult PostPublish(int id)
        {
            var publisher = new LeaguePublisher();
            publisher.Publish(id);
            //var json = publisher.Publish(id);

            ////TODO: need to send back sensible code depending on publishing success
            ////return this.Ok();

            //var response = this.Request.CreateResponse(HttpStatusCode.OK);
            //response.Content = new StringContent(json, Encoding.UTF8, "application/json");

            //return response;

            return this.Ok(new { result = "success" });
        }

        [Route("api/leagues/{id}/home-screen")]
        public IHttpActionResult GetHomeScreen(int id)
        {
            var league = this.repository.Find(id);
            var resource = new ContentResource { Text = league.HomeScreen };
            return this.Ok(resource);
        }

        [Route("api/leagues/{id}/home-screen")]
        public IHttpActionResult PutHomeScreen(int id, ContentResource resource)
        {
            var league = this.repository.Find(id);
            league.HomeScreen = resource.Text;
            this.repository.InsertOrUpdate(league);
            this.repository.Save();
            return this.Ok(resource);
        }

        [Route("api/leagues/{id}/rules-screen")]
        public IHttpActionResult GetRulesScreen(int id)
        {
            var league = this.repository.Find(id);
            var resource = new ContentResource { Text = league.RulesScreen };
            return this.Ok();
        }

        [Route("api/leagues/{id}/rules-screen")]
        public IHttpActionResult PutRulesScreen(int id, ContentResource resource)
        {
            var league = this.repository.Find(id);
            league.RulesScreen = resource.Text;
            this.repository.InsertOrUpdate(league);
            this.repository.Save();
            return this.Ok(resource);
        }

    }

    public class ContentResource
    {
        public string Text { get; set; }
    }
}
