using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LeagueScheduler.Controllers
{
    [Authorize]
    public class AdminController : Controller
    {
        //
        // GET: /Admin/
        public ActionResult Index()
        {
            this.ViewBag.ExtraAppHostCss = "admin-appHost";
            //return View();
            return View("IndexNG");
        }

        public ActionResult New()
        {
            this.ViewBag.ExtraAppHostCss = "admin-appHost";
            return View("IndexNG");
        }
	}
}