
export const ROUTES = {
    CATEGORIES: 'categories-api'
}

export const Message = {
    RequestFailed: "Request Gagal",
    InternalServerError: "Internal Server Error",
}

export const languageCode = {
    IndonesiaLangCode: "id",
    EnglishLangCode: "en",
    DefaultLanguageCode: "id"
}

export const localStorageKey = {
    LanguageKey: "lang"
}

export const LanguageSystem = typeof localStorage !== "undefined"
    ? localStorage.getItem(localStorageKey.LanguageKey) || languageCode.DefaultLanguageCode
    : languageCode.DefaultLanguageCode

export const TOASTPOSITIONDEFAULT = "top-center"

export const PAGINATIONLIMITDEFAULT = 10

export const PAGINATIONLIMITOPTIONDEFAULT = [10, 20, 50, 100]

export const DEBOUNCEDEFAULTDURATION = 200