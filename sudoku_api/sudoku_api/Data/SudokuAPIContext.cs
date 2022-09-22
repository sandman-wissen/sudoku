using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using sudoku_api.Models;

public class SudokuAPIContext : DbContext
{
    public SudokuAPIContext(DbContextOptions<SudokuAPIContext> options)
        : base(options)
    {
    }

    public DbSet<sudoku_api.Models.SudokuSolverData> SudokuSolverData { get; set; } = default!;

}
