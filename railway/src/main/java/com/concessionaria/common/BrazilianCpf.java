package com.concessionaria.common;

public final class BrazilianCpf {
    private BrazilianCpf() {
    }

    public static String digits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    public static String format(String value) {
        String cpf = digits(value);
        if (cpf.length() != 11) {
            return value == null ? "" : value.trim();
        }
        return cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9);
    }

    public static boolean isValid(String value) {
        String cpf = digits(value);
        if (cpf.length() != 11) {
            return false;
        }
        if (cpf.chars().distinct().count() == 1) {
            return false;
        }

        int firstDigit = verificationDigit(cpf, 9, 10);
        int secondDigit = verificationDigit(cpf, 10, 11);
        return firstDigit == Character.digit(cpf.charAt(9), 10)
                && secondDigit == Character.digit(cpf.charAt(10), 10);
    }

    private static int verificationDigit(String cpf, int length, int weight) {
        int sum = 0;
        for (int index = 0; index < length; index += 1) {
            sum += Character.digit(cpf.charAt(index), 10) * (weight - index);
        }
        int remainder = (sum * 10) % 11;
        return remainder == 10 ? 0 : remainder;
    }
}
