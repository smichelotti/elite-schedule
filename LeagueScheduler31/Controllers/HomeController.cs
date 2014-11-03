using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LeagueScheduler.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(bool archived = false)
        {
            this.ViewBag.IsArchived = archived;
            ILeagueRepository repository = new LeagueRepository();
            this.ViewData.Model = (from l in repository.All
                                  where l.IsArchived == archived &&
                                        l.IsActive == true
                                  orderby l.Name
                                  select l).ToList();
            return View();
        }

        public ActionResult League(int id)
        {
            return View();
            //return View("LeagueNG");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}