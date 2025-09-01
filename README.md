# <font color="#4285f4">G</font><font color="#ea4335">o</font><font color="#fbbc05">g</font><font color="#4285f4">g</font><font color="#34a853">l</font><font color="#ea4335">e</font>Maps Tools

Extracting and parsing tools for GoggleMaps

## How to use

GoggleMaps-Tools require the data to be extracted from MPQ files into DBC files, and DBC to be converted to JSON files to easily work with the data.

1. Extract the data:
   `npm run export -- <PATH_TO_WOW_DATA_FOLDER>`
2. Create lua files fron the json files extracted above:
   `npm start`
3. Copy all the lua files in `exports/lua` to `Interface/Addons/GoggleMaps/data`

> [!TIP]
> If you already have extracted the data, you can simply run `npm start` to create the lua files.
