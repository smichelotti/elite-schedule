using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LeagueScheduler.Controllers
{
    public class TeamsController : ApiController
    {
        //private const string partitionKey = "2013-14";
        //TODO: refactor this dependency out
        //private SchedulerTableContext context = ContextFactory.CreateContext();
        private ITeamRepository repository = new TeamRepository();

        public List<Team> Get(int leagueId)
        {
            //return context.Teams.ToList().OrderBy(x => x.Name).ToList();
            return this.repository.All.Where(x => x.LeagueId == leagueId).OrderBy(x => x.Name).ToList();
            //return this.repository.AllIncluding(x => x.League).OrderBy(x => x.Name).ToList();
        }

        public Team Post(Team item)
        {
            //item.RowKey = Guid.NewGuid().ToString();
            //item.PartitionKey = partitionKey;
            
            //this.context.AddObject("Teams", item);
            //this.context.SaveChangesWithRetries();

            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public Team Put(Team item)
        {
            //this.context.AttachTo("Teams", item, "*");
            //this.context.UpdateObject(item);
            //this.context.SaveChanges();

            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public HttpResponseMessage Delete(int id)
        {
            //var item = new Team { PartitionKey = partitionKey, RowKey = id };
            //this.context.AttachTo("Teams", item, "*");
            //this.context.DeleteObject(item);
            //this.context.SaveChanges();

            this.repository.Delete(id);
            this.repository.Save();
            var response = this.Request.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }
    }
}
