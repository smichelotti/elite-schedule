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
        public ActionResult Index()
        {
            ILeagueRepository repository = new LeagueRepository();
            this.ViewData.Model = repository.All.OrderBy(x => x.Name).ToList();
            return View();
        }

        public ActionResult League(int id)
        {
            //return View("Index");
            return View();
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