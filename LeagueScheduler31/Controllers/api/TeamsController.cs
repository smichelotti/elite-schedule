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
    public class TeamsController : ApiController
    {
        private ITeamRepository repository = new TeamRepository();

        public List<Team> Get(int leagueId)
        {
            return this.repository.All.Where(x => x.LeagueId == leagueId).OrderBy(x => x.Division).ThenBy(x => x.Name).ToList();
        }

        public Team Post(Team item)
        {
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public Team Put(Team item)
        {
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
    }
}
