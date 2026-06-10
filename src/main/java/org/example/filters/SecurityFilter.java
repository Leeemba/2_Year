package org.example.filters;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebFilter("/checkArea")
public class SecurityFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);

        // Проверяем, что запрос прошел валидацию в ControllerServlet
        if (session == null || session.getAttribute("validationPassed") == null) {
            // Прямой доступ запрещен
            httpResponse.setContentType("application/json");
            httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
            httpResponse.getWriter().write("{\"error\":\"Direct access to /checkarea is not allowed\"}");
            return;
        }

        // Удаляем флаг после использования (одноразовый)
        session.removeAttribute("validationPassed");
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Инициализация не требуется
    }

    @Override
    public void destroy() {
        // Очистка не требуется
    }
}