using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class League 
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDirty { get; set; }
        public string HomeScreen { get; set; }
        public string RulesScreen { get; set; }
        public bool IsArchived { get; set; }
        public bool IsActive { get; set; }
    }
}