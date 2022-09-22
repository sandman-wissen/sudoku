using System.ComponentModel.DataAnnotations;

namespace sudoku_api.Models
{
    public class SudokuSolverData
    {
        [Key]
        public int Id { get; set; }        
        public string SolvedString { get; set; }
        public string Name { get; set; }
        public DateTime Date { get; set; }

    }
}
