<%--
  Created by IntelliJ IDEA.
  User: dista
  Date: 09.12.2025
  Time: 3:41
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, org.example.models.Point" %>
<!DOCTYPE html>
<html lang="ru-RU">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="author" content="Баукин Максим Александрович">
    <meta name="description" content="Веб-программирование: Лабораторная работа №2. Результаты проверки">
    <meta name="keywords" content="ITMO, ИТМО, ПИиКТ, ВТ, Лабораторная работа, Веб-программирование"/>

    <link href="stylesheets/styles.css" rel="stylesheet">

    <title>Результаты проверки | Веб-программирование</title>
</head>

<body>
<header class="shaded animated">
    <h1>Веб-программирование, Лабораторная работа №2, Вариант 142</h1>
    <div id="credit">
        <a href="https://github.com/Leeemba" class="illuminated animated" title="Перейти к GitHub профилю">
            Баукин Максим Александрович, P3230
        </a>
    </div>
</header>

<table id="mainTable" class="shaded">
    <thead>
    <td colspan="5">
        <h3>Результаты проверки:</h3>
    </td>
    </thead>

    <tbody>
    <tr>
        <td colspan="5"><hr></td>
    </tr>
    </tbody>

    <tfoot>
    <tr>
        <td colspan="5" id="outputContainer">
            <% List<Point> points = (List<Point>) request.getSession().getAttribute("points");
                if (points == null) {
            %>
            <h4>
                <span id="notifications" class="outputStub notification">Нет результатов</span>
            </h4>
            <table id="outputTable">
                <tr>
                    <th>X</th>
                    <th>Y</th>
                    <th>R</th>
                    <th>Точка входит в ОДЗ</th>
                </tr>
            </table>
            <% } else { %>
            <table id='outputTable'>
                <tr>
                    <th>X</th>
                    <th>Y</th>
                    <th>R</th>
                    <th>Точка входит в ОДЗ</th>
                </tr>
                <% for (Point point : points) { %>
                <tr>
                    <td>
                        <%= point.getX() %>
                    </td>
                    <td>
                        <%= point.getY() %>
                    </td>
                    <td>
                        <%= point.getR() %>
                    </td>
                    <td>
                        <%= point.isInArea() ? "<span class=\"success\">Есть пробитие!</span>"
                                : "<span class=\"fail\">Попробуй ещё раз</span>" %>
                    </td>
                </tr>
                <% } %>
            </table>
            <% } %>
        </td>
    </tr>
    <tr>
        <td>
            <div id="goBack">
                <a href="index.jsp">Вернуться к форме</a>
            </div>
        </td>
    </tr>
    </tfoot>

</table>

<footer class="shaded animated">
    <figure>
        <figcaption>2025</figcaption>
    </figure>
</footer>

<script src="main.js"></script>
</body>

</html>