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
        public async Task<HttpResponseMessage> Get()
        {
            using (var httpClient = new HttpClient())
            {
                var json = await httpClient.GetStringAsync("https://dl.dropboxusercontent.com/u/20432002/HYBA/leagueData-fall2013.json");
                var response = this.Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(json, Encoding.UTF8, "application/json");

                return response;
            }
        }

        public HttpResponseMessage Get(int id)
        {
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
