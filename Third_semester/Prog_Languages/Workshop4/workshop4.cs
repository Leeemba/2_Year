
using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Globalization;

class Movie
{
    public string Title { get; set; }
    public List<string> Directors { get; set; }
    public List<string> Genres { get; set; }
    public double? Rating { get; set; }
    public int? Year { get; set; }

    public static Movie FromCsv(string[] fields)
    {
        // Пример header (для понимания индексов):
        // "imdb_title_id","title","original_title","year","date_published","genre","duration","country","language","director","writer","production_company","actors","description","avg_vote","votes","budget","usa_gross_income","worldwide_gross_income","metascore","reviews_from_users","reviews_from_critics"

        // Индексы для выборки:
        // title - 1
        // director - 9
        // genre - 5
        // avg_vote - 14
        // year - 3

        string title = fields[1];
         var directors = fields[9]
            .Split(',')
            .Select(d => d.Trim())
            .Where(d => !string.IsNullOrEmpty(d))
            .ToList();
        string genreRaw = fields[5];
        List<string> genres = genreRaw.Split(',').Select(g => g.Trim()).ToList();

        double? rating = null;
        string ratingRaw = fields[14].Replace(',', '.');  // Замена запятой на точку
        if (double.TryParse(ratingRaw, NumberStyles.Any, CultureInfo.InvariantCulture, out double r))
            rating = r;

        int? year = null;
        if (int.TryParse(fields[3], out int y))
            year = y;

        return new Movie
        {
            Title = title,
            Directors = directors,
            Genres = genres,
            Rating = rating,
            Year = year
        };
    }
}

class Program
{
    static void Main()
    {
        string path = "D:/yDownloads/LAB5/IMDb movies.csv"; // Путь к локальному файлу после скачивания

        var csvData = ReadAllCsvLines(path);

        // Пропускаем строку с заголовками
        var movies = csvData.Skip(1)
            .Select(Movie.FromCsv)
            .ToList();

        // 2. Все фильмы режиссёра Tarantino
        string directorName = "Tarantino";
        var tarMovies = movies
        .Where(m => m.Directors != null && m.Directors.Any(d => d.Contains(directorName, StringComparison.OrdinalIgnoreCase)))
        .ToList();
        Console.WriteLine($"Фильмы режиссёра '{directorName}': {tarMovies.Count}");
        foreach (var m in tarMovies)
            Console.WriteLine($"- {m.Title} ({m.Year}), рейтинг: {m.Rating}");

        Console.WriteLine();

        // 3. 5 самых высокооценённых фильма, выпущенных после 2010
        var top5After2010 = movies
            .Where(m => m?.Year > 2010)
            .Where(movies => movies.Rating is not null)
            .OrderByDescending(m => m.Rating)
            .Take(5)
            .ToList();

        Console.WriteLine("5 самых высокооценённых фильмов после 2010:");
        foreach (var m in top5After2010)
            Console.WriteLine($"- {m.Title} ({m.Year}), рейтинг: {m.Rating}");

        Console.WriteLine();

        // 4. Список фильмов жанра Drama
        string genreFilter = "Drama";
        var dramaMovies = movies.Where(m => m.Genres != null && m.Genres.Contains(genreFilter, StringComparer.OrdinalIgnoreCase)).ToList();
        Console.WriteLine($"Фильмы жанра '{genreFilter}': {dramaMovies.Count}");
        foreach (var m in dramaMovies.Take(10)) // Выведем первых 10 для примера
            Console.WriteLine($"- {m.Title} ({m.Year}), режиссёр: {m.Directors}");

        Console.WriteLine();
        // 5. Режиссёр с наибольшим количеством фильмов
        var directorCount = movies
        .SelectMany(m => m.Directors ?? new List<string>())
        .GroupBy(d => d)
        .Select(g => new { Director = g.Key, Count = g.Count() })
        .OrderByDescending(x => x.Count)
        .FirstOrDefault();

if (directorCount != null)
    Console.WriteLine($"Режиссёр с наибольшим числом фильмов: {directorCount.Director} ({directorCount.Count} фильмов)");
else
    Console.WriteLine("Данные по режиссёрам отсутствуют.");
    }

    static List<string[]> ReadAllCsvLines(string filePath)
    {
        var result = new List<string[]>();

        using (var parser = new TextFieldParser(filePath))
        {
            parser.TextFieldType = FieldType.Delimited;
            parser.SetDelimiters(",");
            parser.HasFieldsEnclosedInQuotes = true;

            while (!parser.EndOfData)
            {
                string[] fields = parser.ReadFields();
                result.Add(fields);
            }
        }

        return result;
    }
}



