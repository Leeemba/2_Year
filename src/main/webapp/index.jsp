<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@page import="java.util.List, org.example.models.Point" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="author" content="Баукин Максим Александрович">
    <meta name="description" content="Веб-программирование: Лабораторная работа №2.">
    <meta name="keywords" content="ITMO, ИТМО, ПИиКТ, ВТ, Лабораторная работа, Веб-программирование"/>

    <link href="stylesheets/styles.css" rel="stylesheet">
    <title>Лабораторная работа №2 | Веб-программирование</title>
</head>

<body>
<header class="shaded animated">
    <h1>Лабораторная работа №2 по дисциплине «Вэб-программирование»</h1>
    <h2>Вариант 142</h2>
    <div id="credit">
        <a href="https://github.com/Leeemba" <%--class="illuminated animated"--%>  title="Перейти к GitHub профилю"> Баукин Максим Александрович, P3230</a>
    </div>
</header>

<%
    // Получаем последнее сохраненное значение R из сессии
    Float lastR = (Float) session.getAttribute("lastR");
    String lastRStr = null;
    if (lastR != null) {
        lastRStr = String.valueOf(lastR);
        // Убираем лишние нули после запятой для корректного сравнения
        if (lastRStr.endsWith(".0")) {
            lastRStr = lastRStr.substring(0, lastRStr.length() - 2);
        }
    }
%>

<table id="mainTable" class="shaded">
    <thead>
    <td colspan="5">
        <h3>Валидация введённых значений:</h3>
    </td>
    </thead>
    <tbody>
    <tr>
        <td colspan="5">
            <hr>
        </td>
    </tr>

    <tr>
        <td rowspan="3">Выберите X:</td>
        <td><input name="X-button" class="illuminated animated" type="button" value="-5"></td>
        <td><input name="X-button" class="illuminated animated" type="button" value="-4"></td>
        <td><input name="X-button" class="illuminated animated" type="button" value="-3"></td>
        <td rowspan="6">
            <svg xmlns="http://www.w3.org/2000/svg" id="svg">
                <line x1="0" y1="150" x2="300" y2="150" stroke="#000720"></line>
                <line x1="150" y1="0" x2="150" y2="300" stroke="#000720"></line>

                <line x1="270" y1="148" x2="270" y2="152" stroke="#000720"></line>
                <text x="265" y="140" class="-r-text">R</text>

                <line x1="210" y1="148" x2="210" y2="152" stroke="#000720"></line>
                <text x="200" y="140" class="r/2-text">R/2</text>

                <line x1="90" y1="148" x2="90" y2="152" stroke="#000720"></line>
                <text x="75" y="140" class="-r/2-text">-R/2</text>

                <line x1="30" y1="148" x2="30" y2="152" stroke="#000720"></line>
                <text x="20" y="140" class="-r-text">-R</text>

                <line x1="148" y1="30" x2="152" y2="30" stroke="#000720"></line>
                <text x="156" y="35" class="r-text">R</text>

                <line x1="148" y1="90" x2="152" y2="90" stroke="#000720"></line>
                <text x="156" y="95" class="r/2-text">R/2</text>

                <line x1="148" y1="210" x2="152" y2="210" stroke="#000720"></line>
                <text x="156" y="215" class="-r/2-text">-R/2</text>

                <line x1="148" y1="270" x2="152" y2="270" stroke="#000720"></line>
                <text x="156" y="275" class="-r-text">-R</text>

                <polygon points="300,150 295,155 295, 145" fill="#000720" stroke="#000720"></polygon>
                <polygon points="150,0 145,5 155,5" fill="#000720" stroke="#000720"></polygon>

                <rect x="90" y="150" width="60" height="120" fill-opacity="0.2" stroke="#0a0eff" fill="#0a0eff"></rect>

                <polygon points="270,150 150,150 150,30" fill-opacity="0.2" stroke="#FFA500" fill="#FFA500"></polygon>

                <path d="M150 150 L 270 150 C 270 220 220 270 150 270 L Z" fill-opacity="0.2" stroke="#ff0000" fill="#ff0000"></path>
            </svg>
        </td>
    </tr>
    <tr>
        <td><input name="X-button" class="illuminated animated" type="button" value="-2"></td>
        <td><input name="X-button" class="illuminated animated" type="button" value=-1></td>
        <td><input name="X-button" class="illuminated animated" type="button" value="0"></td>
    </tr>
    <tr>
        <td><input name="X-button" class="illuminated animated" type="button" value="1"></td>
        <td><input name="X-button" class="illuminated animated" type="button" value="2"></td>
        <td><input name="X-button" class="illuminated animated" type="button" value="3"></td>
    </tr>

    <tr>
        <td>Введите Y:</td>
        <td colspan="3"><input required name="Y-input" class="illuminated animated" type="text"
                               placeholder="-5..5" maxlength="6"
                               pattern="^[-+]?(?:[0-4](?:[.,]\d{1,5})?|5(?:[.,]0{1,5})?)$" ></td>
    </tr>

    <tr>
        <td rowspan="2">Выберите R:</td>
        <td>1<input name="R-radio-group" class="illuminated animated" type="radio" value="1" <%= "1".equals(lastRStr) ? "checked" : "" %>></td>
        <td>1.5<input name="R-radio-group" class="illuminated animated" type="radio" value="1.5" <%= "1.5".equals(lastRStr) ? "checked" : "" %>></td>
        <td>2<input name="R-radio-group" class="illuminated animated" type="radio" value="2" <%= "2".equals(lastRStr) ? "checked" : "" %>></td>
    </tr>
    <tr>
        <td>2.5<input name="R-radio-group" class="illuminated animated" type="radio" value="2.5" <%= "2.5".equals(lastRStr) ? "checked" : "" %>></td>
        <td>3<input name="R-radio-group" class="illuminated animated" type="radio" value="3" <%= "3".equals(lastRStr) ? "checked" : "" %>></td>
    </tr>

    <tr>
        <td colspan="5">
            <button type="submit" id="checkButton">Проверить</button>
        </td>
    </tr>

    <tr>
        <td colspan="5">
            <hr>
        </td>
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
            <h4>
                <span class="notification"></span>
            </h4>
            <table id="outputTable">
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
        <td colspan="5">
            <button type="button" id="clearButton" onclick="clearTable()">Очистить таблицу</button>
        </td>
    </tr>
    </tfoot>

</table>

<footer class="shaded animated">
    <figure>
        <figcaption><i>A mediocrity can never become a natural talent but can't mediocrity still get better than a natural talent?</i></figcaption>
    </figure>
</footer>

<script
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
        crossorigin="anonymous"></script>
<script src="main.js"></script>
</body>

</html>