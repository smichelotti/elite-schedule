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
            this.ViewData.Model = repository.All.Where(x => x.IsArchived == archived).OrderBy(x => x.Name).ToList();
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