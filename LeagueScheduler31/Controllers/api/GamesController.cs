using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LeagueScheduler.Controllers
{
    public class GamesController : ApiController
    {
        private IGameRepository repository = new GameRepository();

        public List<Game> Get(int leagueId)
        {
            return this.repository.All.Where(x => x.LeagueId == leagueId).OrderBy(x => x.GameTime).ToList();
        }

        public Game Post(Game item)
        {
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public Game Put(Game item)
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
