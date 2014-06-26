using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace LeagueScheduler.Controllers
{
    public class LeagueDataController : ApiController
    {
        public HttpResponseMessage Get()
        {
            var leagueRepository = new LeagueRepository();
            var leagues = leagueRepository.All.ToList().Select(x => new { Id = x.Id, Name = x.Name, IsArchived = x.IsArchived, Href = "/api/leaguedata/" + x.Id }).OrderBy(x => x.Id).ThenBy(x => x.IsArchived).ToList();
            var response = this.Request.CreateResponse(HttpStatusCode.OK, leagues);
            return response;
        }

        public HttpResponseMessage Get(int id)
        {
            //System.Threading.Thread.Sleep(3000);
            var scheduleRepo = new ScheduleRepository();
            var schedule = scheduleRepo.FindCurrent(id);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            //response.Content = new StringContent(schedule.JsonSchedule, Encoding.UTF8, "application/json");
            response.Content = new StringContent(schedule , Encoding.UTF8, "application/json");

            return response;
        }

        [Route("api/leaguedata/{id}/preview")]
        public HttpResponseMessage GetPreview(int id)
        {
            var jsonBuilder = new LeagueJsonBuilder();
            var json = jsonBuilder.CreateJson(id);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }
    }
}
