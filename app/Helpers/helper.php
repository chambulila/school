<?php

function ifCan($ability, $message = "You do not have permission to perform this action.")
{
    if (auth()->user()->cannot($ability)) {
         return abort( 403, $message);
    }
}
